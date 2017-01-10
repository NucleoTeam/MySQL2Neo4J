package com.synload.m2n;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurerAdapter;

import java.io.File;

/**
 * Created by Nathaniel on 1/2/2017.
 */
@Configuration
public class Config extends WebMvcConfigurerAdapter {
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            registry.addResourceHandler("/**").addResourceLocations((new File("static/").toURI().toURL()).toString());
        }catch (Exception e){

        }
    }
}