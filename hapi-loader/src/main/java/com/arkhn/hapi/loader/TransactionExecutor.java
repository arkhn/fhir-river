package com.arkhn.hapi.loader;

import java.util.List;

import org.hl7.fhir.instance.model.api.IBaseResource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.support.TransactionCallback;

import ca.uhn.fhir.jpa.api.dao.DaoRegistry;
import ca.uhn.fhir.jpa.api.dao.IFhirResourceDao;
import ca.uhn.fhir.jpa.dao.tx.HapiTransactionService;

public class TransactionExecutor implements Runnable {
    @Autowired
    DaoRegistry daoRegistry;

    @Autowired
    private HapiTransactionService txService;

    private final Logger log = LoggerFactory.getLogger(TransactionExecutor.class);

    private List<IBaseResource> buffer;

    public TransactionExecutor(DaoRegistry daoRegistry, HapiTransactionService txService, List<IBaseResource> buffer) {
        this.daoRegistry = daoRegistry;
        this.txService = txService;
        this.buffer = buffer;
    }

    public void run() {
        long start = System.currentTimeMillis();

        @SuppressWarnings("unchecked")
        TransactionCallback<Object> txCallback = status -> {

            for (IBaseResource r : buffer) {
                try {
                    IFhirResourceDao<IBaseResource> dao = daoRegistry.getResourceDao(r.getClass().getSimpleName());
                    dao.update(r);
                } catch (Exception e) {
                    log.error(e.getMessage());
                    log.error("Stopping batch update");
                    return null;
                }
            }
            return null;
        };

        log.info("Begin transaction with {} resources", buffer.size());
        txService.execute(null, txCallback);
        long took = System.currentTimeMillis() - start;
        log.info("Inserted {} resources. Took {}ms", buffer.size(), took);

    }

}
