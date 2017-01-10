package com.synload.m2n.controllers;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.File;

/**
 * Created by Nathaniel on 1/1/2017.
 */
@RestController
@EnableAutoConfiguration
@RequestMapping("/")
public class Index {
    @RequestMapping("/")
    public byte[] index() {
        try {
            byte[] out = IOUtils.toByteArray(FileUtils.openInputStream(new File("www/index.html")));
            return out;
        }catch(Exception e){

        }
        return null;
    }
}