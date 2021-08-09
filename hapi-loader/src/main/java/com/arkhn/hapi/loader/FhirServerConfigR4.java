package com.arkhn.hapi.loader;

import com.arkhn.hapi.loader.annotations.OnR4Condition;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.jpa.config.BaseJavaConfigR4;
import ca.uhn.fhir.jpa.search.DatabaseBackedPagingProvider;
import ca.uhn.fhir.jpa.search.lastn.ElasticsearchSvcImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Conditional;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;

import javax.persistence.EntityManagerFactory;
import javax.sql.DataSource;

@Configuration
@Conditional(OnR4Condition.class)
public class FhirServerConfigR4 extends BaseJavaConfigR4 {

  @Autowired
  private DataSource myDataSource;

  /**
   * We override the paging provider definition so that we can customize the
   * default/max page sizes for search results. You can set these however you
   * want, although very large page sizes will require a lot of RAM.
   */
  @Autowired
  AppProperties appProperties;

  @Override
  public DatabaseBackedPagingProvider databaseBackedPagingProvider() {
    DatabaseBackedPagingProvider pagingProvider = super.databaseBackedPagingProvider();
    pagingProvider.setDefaultPageSize(appProperties.getDefault_page_size());
    pagingProvider.setMaximumPageSize(appProperties.getMax_page_size());
    return pagingProvider;
  }

  @Autowired
  private ConfigurableEnvironment configurableEnvironment;

  @Override
  @Bean()
  public LocalContainerEntityManagerFactoryBean entityManagerFactory() {
    LocalContainerEntityManagerFactoryBean retVal = super.entityManagerFactory();
    retVal.setPersistenceUnitName("HAPI_PU");

    try {
      retVal.setDataSource(myDataSource);
    } catch (Exception e) {
      throw new ConfigurationException("Could not set the data source due to a configuration issue", e);
    }

    retVal.setJpaProperties(EnvironmentHelper.getHibernateProperties(configurableEnvironment));
    return retVal;
  }

  @Bean
  @Primary
  public JpaTransactionManager hapiTransactionManager(EntityManagerFactory entityManagerFactory) {
    JpaTransactionManager retVal = new JpaTransactionManager();
    retVal.setEntityManagerFactory(entityManagerFactory);
    return retVal;
  }

  @Bean()
  public ElasticsearchSvcImpl elasticsearchSvc() {
    if (EnvironmentHelper.isElasticsearchEnabled(configurableEnvironment)) {
      String elasticsearchUrl = EnvironmentHelper.getElasticsearchServerUrl(configurableEnvironment);
      String elasticsearchHost;
      if (elasticsearchUrl.startsWith("http")) {
        elasticsearchHost = elasticsearchUrl.substring(elasticsearchUrl.indexOf("://") + 3,
            elasticsearchUrl.lastIndexOf(":"));
      } else {
        elasticsearchHost = elasticsearchUrl.substring(0, elasticsearchUrl.indexOf(":"));
      }

      String elasticsearchUsername = EnvironmentHelper.getElasticsearchServerUsername(configurableEnvironment);
      String elasticsearchPassword = EnvironmentHelper.getElasticsearchServerPassword(configurableEnvironment);
      int elasticsearchPort = Integer.parseInt(elasticsearchUrl.substring(elasticsearchUrl.lastIndexOf(":") + 1));
      return new ElasticsearchSvcImpl(elasticsearchHost, elasticsearchPort, elasticsearchUsername,
          elasticsearchPassword);
    } else {
      return null;
    }
  }

}
