package com.synload.m2n;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.support.SpringBootServletInitializer;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;

import java.io.File;
import java.sql.Connection;
import java.sql.DriverManager;

/**
 * Created by Nathaniel on 11/26/2016.
 */

@SpringBootApplication
@EnableWebMvc
@EnableScheduling
public class M2N  extends SpringBootServletInitializer {
    public static Connection connect;
    public static void main(String[] args) throws Exception{
        connect = DriverManager.getConnection("jdbc:mysql://192.168.0.33/api?user=root&zeroDateTimeBehavior=convertToNull&autoReconnect=true&characterEncoding=UTF-8&characterSetResults=UTF-8");
        SpringApplication.run(M2N.class,args);
    }
    @Override
    protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
        return application.sources(M2N.class);
    }
}