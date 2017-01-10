package com.synload.m2n.domain.structure;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

/**
 * Created by Nathaniel on 1/1/2017.
 */
public class ColumnInformation {
    public String name;
    public String type;
    public boolean index;
    public boolean primary;
    public ColumnInformation(String name, String type, boolean index, boolean primary){
        this.name = name;
        this.primary = primary;
        this.type = type;
        this.index = index;
    }
}
