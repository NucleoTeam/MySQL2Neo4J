package com.synload.m2n.domain;

import com.synload.m2n.M2N;
import com.synload.m2n.domain.structure.ColumnInformation;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Nathaniel on 1/1/2017.
 */
public class GrabTableInfo {
    public List<ColumnInformation> columns = new ArrayList<ColumnInformation>();
    public GrabTableInfo(String tablename){
        try{
            PreparedStatement statement = M2N.connect.prepareStatement("SHOW COLUMNS FROM `"+tablename+"`");
            ResultSet resultSet = statement.executeQuery();
            while (resultSet.next()) {
                columns.add(
                    new ColumnInformation(
                        resultSet.getString(1),
                        resultSet.getString(2),
                        (resultSet.getString(4).equals(""))?false:true,
                        (resultSet.getString(4).equals("PRI"))?true:false
                    )
                );
            }
        }catch(Exception e){
            e.printStackTrace();
        }
    }
}
