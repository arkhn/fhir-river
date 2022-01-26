package com.arkhn.hapi.loader;

import ca.uhn.fhir.jpa.api.config.DaoConfig;
import ca.uhn.fhir.jpa.binstore.DatabaseBlobBinaryStorageSvcImpl;
import ca.uhn.fhir.jpa.binstore.IBinaryStorageSvc;
import ca.uhn.fhir.jpa.config.HibernatePropertiesProvider;
import ca.uhn.fhir.jpa.model.config.PartitionSettings;
import ca.uhn.fhir.jpa.model.config.PartitionSettings.CrossPartitionReferenceMode;
import ca.uhn.fhir.jpa.model.entity.ModelConfig;
import ca.uhn.fhir.jpa.subscription.channel.subscription.SubscriptionDeliveryHandlerFactory;
import ca.uhn.fhir.jpa.subscription.match.deliver.email.IEmailSender;
import ca.uhn.fhir.jpa.subscription.match.deliver.email.JavaMailEmailSender;
import com.google.common.base.Strings;

import org.hl7.fhir.dstu2.model.Subscription;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.env.YamlPropertySourceLoader;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Primary;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import java.util.Optional;
import javax.sql.DataSource;

/**
 * This is the primary configuration file for the example server
 */
@Configuration
@EnableTransactionManagement
public class FhirServerConfigCommon {

  private static final org.slf4j.Logger ourLog = org.slf4j.LoggerFactory.getLogger(FhirServerConfigCommon.class);

  public FhirServerConfigCommon(AppProperties appProperties) {
    ourLog.info("Server configured to " + (appProperties.getAllow_contains_searches() ? "allow" : "deny")
        + " contains searches");
    ourLog.info(
        "Server configured to " + (appProperties.getAllow_multiple_delete() ? "allow" : "deny") + " multiple deletes");
    ourLog.info("Server configured to " + (appProperties.getAllow_external_references() ? "allow" : "deny")
        + " external references");
    ourLog.info("Server configured to " + (appProperties.getExpunge_enabled() ? "enable" : "disable") + " expunges");
    ourLog.info("Server configured to " + (appProperties.getAllow_placeholder_references() ? "allow" : "deny")
        + " placeholder references");
    ourLog.info("Server configured to " + (appProperties.getAllow_override_default_search_params() ? "allow" : "deny")
        + " overriding default search params");

    if (appProperties.getSubscription().getEmail() != null) {
      AppProperties.Subscription.Email email = appProperties.getSubscription().getEmail();
      ourLog
          .info("Server is configured to enable email with host '" + email.getHost() + "' and port " + email.getPort());
      ourLog.info("Server will use '" + email.getFrom() + "' as the from email address");

      if (!Strings.isNullOrEmpty(email.getUsername())) {
        ourLog.info("Server is configured to use username '" + email.getUsername() + "' for email");
      }

      if (!Strings.isNullOrEmpty(email.getPassword())) {
        ourLog.info("Server is configured to use a password for email");
      }
    }

    if (appProperties.getSubscription().getResthook_enabled()) {
      ourLog.info("REST-hook subscriptions enabled");
    }

    if (appProperties.getSubscription().getEmail() != null) {
      ourLog.info("Email subscriptions enabled");
    }
  }

  /**
   * Configure FHIR properties around the the JPA server via this bean
   */
  @Bean()
  public DaoConfig daoConfig(AppProperties appProperties) {
    DaoConfig retVal = new DaoConfig();

    retVal.setIndexMissingFields(appProperties.getEnable_index_missing_fields() ? DaoConfig.IndexEnabledEnum.ENABLED
        : DaoConfig.IndexEnabledEnum.DISABLED);
    retVal.setAutoCreatePlaceholderReferenceTargets(appProperties.getAuto_create_placeholder_reference_targets());
    retVal.setEnforceReferentialIntegrityOnWrite(appProperties.getEnforce_referential_integrity_on_write());
    retVal.setEnforceReferentialIntegrityOnDelete(appProperties.getEnforce_referential_integrity_on_delete());
    retVal.setDeleteEnabled(appProperties.getDelete_enabled());
    retVal.setMatchUrlCache(appProperties.getMatch_url_cache());
    ourLog.info("Server configured enforce_referential_integrity_on_write: {}", appProperties.getEnforce_referential_integrity_on_write());
    ourLog.info("Server configured delete_enabled: {}", appProperties.getDelete_enabled());
    ourLog.info("Server configured match_url_cache: {}", appProperties.getMatch_url_cache());
    retVal.setAllowContainsSearches(appProperties.getAllow_contains_searches());
    retVal.setAllowMultipleDelete(appProperties.getAllow_multiple_delete());
    retVal.setAllowExternalReferences(appProperties.getAllow_external_references());
    retVal.setAllowInlineMatchUrlReferences(appProperties.getAllow_inline_match_url_references());
    retVal.setExpungeEnabled(appProperties.getExpunge_enabled());
    if (appProperties.getSubscription() != null && appProperties.getSubscription().getEmail() != null)
      retVal.setEmailFromAddress(appProperties.getSubscription().getEmail().getFrom());

    Integer maxFetchSize = appProperties.getMax_page_size();
    retVal.setFetchSizeDefaultMaximum(maxFetchSize);
    ourLog.info("Server configured to have a maximum fetch size of "
        + (maxFetchSize == Integer.MAX_VALUE ? "'unlimited'" : maxFetchSize));

    Long reuseCachedSearchResultsMillis = appProperties.getReuse_cached_search_results_millis();
    retVal.setReuseCachedSearchResultsForMillis(reuseCachedSearchResultsMillis);
    ourLog.info("Server configured to cache search results for {} milliseconds", reuseCachedSearchResultsMillis);

    Long retainCachedSearchesMinutes = appProperties.getRetain_cached_searches_mins();
    retVal.setExpireSearchResultsAfterMillis(retainCachedSearchesMinutes * 60 * 1000);

    if (appProperties.getSubscription() != null) {
      // Subscriptions are enabled by channel type
      if (appProperties.getSubscription().getResthook_enabled()) {
        ourLog.info("Enabling REST-hook subscriptions");
        retVal.addSupportedSubscriptionType(org.hl7.fhir.dstu2.model.Subscription.SubscriptionChannelType.RESTHOOK);
      }
      if (appProperties.getSubscription().getEmail() != null) {
        ourLog.info("Enabling email subscriptions");
        retVal.addSupportedSubscriptionType(org.hl7.fhir.dstu2.model.Subscription.SubscriptionChannelType.EMAIL);
      }
      if (appProperties.getSubscription().getWebsocket_enabled()) {
        ourLog.info("Enabling websocket subscriptions");
        retVal.addSupportedSubscriptionType(org.hl7.fhir.dstu2.model.Subscription.SubscriptionChannelType.WEBSOCKET);
      }
    }

    retVal.setFilterParameterEnabled(appProperties.getFilter_search_enabled());

    return retVal;
  }

  @Bean
  public YamlPropertySourceLoader yamlPropertySourceLoader() {
    return new YamlPropertySourceLoader();
  }

  @Bean
  public PartitionSettings partitionSettings(AppProperties appProperties) {
    PartitionSettings retVal = new PartitionSettings();

    // Partitioning
    if (appProperties.getPartitioning() != null) {
      retVal.setPartitioningEnabled(true);
      retVal.setIncludePartitionInSearchHashes(
          appProperties.getPartitioning().getPartitioning_include_in_search_hashes());
      if (appProperties.getPartitioning().getAllow_references_across_partitions()) {
        retVal.setAllowReferencesAcrossPartitions(CrossPartitionReferenceMode.ALLOWED_UNQUALIFIED);
      } else {
        retVal.setAllowReferencesAcrossPartitions(CrossPartitionReferenceMode.NOT_ALLOWED);
      }
    }

    return retVal;
  }

  @Primary
  @Bean
  public HibernatePropertiesProvider jpaStarterDialectProvider(
      LocalContainerEntityManagerFactoryBean myEntityManagerFactory) {
    return new JpaHibernatePropertiesProvider(myEntityManagerFactory);
  }

  @Bean
  public ModelConfig modelConfig(AppProperties appProperties) {
    ModelConfig modelConfig = new ModelConfig();
    modelConfig.setAllowContainsSearches(appProperties.getAllow_contains_searches());
    modelConfig.setAllowExternalReferences(appProperties.getAllow_external_references());
    modelConfig.setDefaultSearchParamsCanBeOverridden(appProperties.getAllow_override_default_search_params());
    if (appProperties.getSubscription() != null && appProperties.getSubscription().getEmail() != null)
      modelConfig.setEmailFromAddress(appProperties.getSubscription().getEmail().getFrom());

    // You can enable these if you want to support Subscriptions from your server
    if (appProperties.getSubscription() != null && appProperties.getSubscription().getResthook_enabled() != null) {
      modelConfig.addSupportedSubscriptionType(Subscription.SubscriptionChannelType.RESTHOOK);
    }

    if (appProperties.getSubscription() != null && appProperties.getSubscription().getEmail() != null) {
      modelConfig.addSupportedSubscriptionType(Subscription.SubscriptionChannelType.EMAIL);
    }

    modelConfig.setNormalizedQuantitySearchLevel(appProperties.getNormalized_quantity_search_level());
    return modelConfig;
  }

  @ConfigurationProperties(prefix = "spring.datasource")
  @Bean(destroyMethod = "close")
  public DataSource dataSource() {
    return DataSourceBuilder.create().build();
  }

  @Lazy
  @Bean
  public IBinaryStorageSvc binaryStorageSvc(AppProperties appProperties) {
    DatabaseBlobBinaryStorageSvcImpl binaryStorageSvc = new DatabaseBlobBinaryStorageSvcImpl();

    if (appProperties.getMax_binary_size() != null) {
      binaryStorageSvc.setMaximumBinarySize(appProperties.getMax_binary_size());
    }

    return binaryStorageSvc;
  }

  @Bean()
  public IEmailSender emailSender(AppProperties appProperties,
      Optional<SubscriptionDeliveryHandlerFactory> subscriptionDeliveryHandlerFactory) {
    if (appProperties.getSubscription() != null && appProperties.getSubscription().getEmail() != null) {
      JavaMailEmailSender retVal = new JavaMailEmailSender();

      AppProperties.Subscription.Email email = appProperties.getSubscription().getEmail();
      retVal.setSmtpServerHostname(email.getHost());
      retVal.setSmtpServerPort(email.getPort());
      retVal.setSmtpServerUsername(email.getUsername());
      retVal.setSmtpServerPassword(email.getPassword());
      retVal.setAuth(email.getAuth());
      retVal.setStartTlsEnable(email.getStartTlsEnable());
      retVal.setStartTlsRequired(email.getStartTlsRequired());
      retVal.setQuitWait(email.getQuitWait());

      if (subscriptionDeliveryHandlerFactory.isPresent())
        subscriptionDeliveryHandlerFactory.get().setEmailSender(retVal);

      return retVal;
    }

    return null;
  }
}
