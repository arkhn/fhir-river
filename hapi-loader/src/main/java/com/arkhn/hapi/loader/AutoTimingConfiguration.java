package com.arkhn.hapi.loader;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;

import io.micrometer.core.aop.TimedAspect;
import io.micrometer.core.instrument.MeterRegistry;

// the @Timed micrometer annotation does not work out-of-the-box 
// on custom methods (such as ResourceListener.listen) so we have to 
// manually setup a TimedAspect
// https://github.com/micrometer-metrics/micrometer/issues/361
@Configuration
@EnableAspectJAutoProxy
public class AutoTimingConfiguration {
    @Bean
    public TimedAspect timedAspect(MeterRegistry registry) {
        return new TimedAspect(registry);
    }
}