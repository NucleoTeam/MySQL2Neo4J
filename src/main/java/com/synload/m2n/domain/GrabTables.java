package com.synload.m2n.domain;

import com.synload.m2n.M2N;

import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.List;

/**
 * Created by Nathaniel on 1/1/2017.
 */
public class GrabTables {
    public List<String> tables = new ArrayList<>();
    public GrabTables (){
        try {
            Statement statement = M2N.connect.createStatement();
            ResultSet resultSet = statement.executeQuery("show tables");
            while (resultSet.next()) {
                tables.add(resultSet.getString(1));
            }
        }catch (Exception e){

        }
    }
}
