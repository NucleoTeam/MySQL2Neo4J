function appendSql(q, add, div){
    q.query+=((q.query!="")?div+" ":"")+add;
}
function labelToNewName(label, table, column){
    return (label.elements[table].columns[column])?label.elements[table].columns[column]:column;
}
var Table = function(main){
    this.columns = {};
    this.include ={};
    this.columnCount=0;
    this.type = "join";
    this.reference='';
    this.addColumn = function(name, newName){
        this.columns[name]=newName;
        this.include[name]=true;
        this.columnCount++;
        main.save();
    }
    this.removeColumn = function(name){
        if(this.columns[name]){
            delete this.columns[name];
            delete this.include[name];
            this.columnCount--;
            main.save();
        }
    }
}
angular.module('m2n.neo4j.label', [])
    .service('Label', ['$q', Label]);

function Label($q){
    this.$q = $q;
    var self = this;
    this.mode = 1;
    this.columnNames = {};
    this.key = "";
    this.name = "";
    this.mainTable = "";
    this.elements = {};
    this.save = function(){
        console.log(this);
        localStorage.setItem("Node,"+this.name, JSON.stringify(this));
    }
    this.open = function(name){
        var obj = JSON.parse(localStorage.getItem("Node,"+name));
        if(obj){
            self.mode = obj.mode;
            self.mainTable = obj.mainTable;
            self.name = name;
            self.elements={};
            self.key = obj.key;
            angular.forEach(obj.elements, function(v, k){
                if(!self.elements[k]){
                    self.elements[k] = new Table(self);
                }
                self.elements[k].reference = v.reference;
                angular.forEach(v.columns, function(v1, k1){
                    self.elements[k].columns[k1]=v1;
                    self.elements[k].columnCount++;
                });
                angular.forEach(v.include, function(v1, k1){
                    self.elements[k].include[k1]=v1;
                });
                self.elements[k].type = v.type;
            });
        }else{
            self.name = name;
        }
        return self;
    }
    this.removeSave = function(name){
        localStorage.removeItem("Node,"+name)
    }
    this.toggleKey = function(table, column){
        if(this.key==column){
            this.key="";
        }else{
            this.key=column;
        }
    }
    this.add = function(table, column){
        if(!this.elements[table]){
            this.elements[table] = new Table(this);
        }
        this.elements[table].addColumn(column, column);
    }
    this.remove = function(table, column){
        this.elements[table].removeColumn(column);
        if(this.elements[table].columnCount==0){
            delete this.elements[table];
        }
    }
    self.ass={query:""};
    this.sql = function(path){
        if(!path){
            path = "./";
        }
        self.ass={query:""};
        var project = self.buildProject();
        var from = self.buildFrom();
        return "SELECT "+self.ass.query+" UNION ALL SELECT "+project+" FROM "+from+" INTO OUTFILE '"+path+self.name+"_label.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\\n';";
    }
    this.buildProject = function(){
        var tmp={query:""};
        self.ass.query="";
        angular.forEach(self.elements, function(table, tableName) {
            if(tableName==self.mainTable){
                angular.forEach( table.columns, function( columnNewName, columnName){
                    if(table.include[columnName]){
                        var newName=((columnName!=columnNewName || self.key==columnName)?" as '"+columnNewName+((self.key==columnName && self.mainTable==tableName)?":ID("+self.name+")'":"'"):"");

                        appendSql(tmp, "`"+tableName+"`.`"+columnName+"`"+newName, ",");
                        appendSql(self.ass, ((columnName!=columnNewName || self.key==columnName)?"'"+columnNewName+((self.key==columnName && self.mainTable==tableName)?":ID("+self.name+")'":"'"):"'"+columnName+"'"), ",");
                    }
                });
            }else{
                if(table.type=="json"){
                    var objects = {query:""};
                    angular.forEach( table.columns, function( columnNewName, columnName){
                        if(table.include[columnName]){
                            appendSql(objects, "'"+columnNewName+"'", ",");
                            appendSql(objects, "`"+tableName+"`.`"+columnName+"`", ",");
                        }
                    });
                    appendSql(self.ass, "'json_"+tableName+"'", ",");
                    var tmpJSON = "REPLACE(CONCAT('[',(SELECT GROUP_CONCAT(JSON_OBJECT("+objects.query+")) as only FROM `"+tableName+"` WHERE `"+table.reference.split(",")[0]+"`="+self.mainTable+"."+table.reference.split(",")[1]+"),']'),'\"', \"'\") as 'json_"+tableName+"'";/* stackoverflow 6660977*/
                    appendSql(tmp, tmpJSON, ",");
                }else if(table.type=="join"){
                    angular.forEach( table.columns, function( columnNewName, columnName){
                        if(table.include[columnName]){
                            var newName=((columnName!=columnNewName || self.key==columnName)?" as '"+columnNewName+((self.key==columnName && self.mainTable==tableName)?":ID("+self.name+")'":"'"):"");
                            appendSql(self.ass, ((columnName!=columnNewName || self.key==columnName)?"'"+columnNewName+((self.key==columnName && self.mainTable==tableName)?":ID("+self.name+")'":"'"):"'"+columnName+"'"), ",");
                            appendSql(tmp, "`"+tableName+"`.`"+columnName+"`"+newName, ",");
                        }
                    });
                }
            }
        });
        return tmp.query;
    }
    this.buildFrom = function(){
        var tmp={query:self.mainTable};
        angular.forEach(self.elements, function(table, tableName) {
            if(tableName!=self.mainTable && table.type=="join"){
                appendSql(tmp, " INNER JOIN "+tableName+" ON "+tableName+".`"+table.reference.split(",")[0]+"`="+self.mainTable+"."+table.reference.split(",")[1], "");
            }
        });
        return tmp.query;
    }
    this.selected = function(table, column){
        if(this.elements[table]){
            return this.elements[table].columns[column];
        }
        return 0;
    }
}
function Relationship($q){
    this.$q = $q;
    var self = this;

    this.title = "";
    this.connection = {'left':[], 'right':[]};
    this.labels = new Array();
    this.pos = new Array();
    this.save = function(){
        var obj = {
            title: self.title,
            connection: self.connection,
            pos: self.pos,
            labels: self.labels
        };
        localStorage.setItem("Relationship,"+self.title, JSON.stringify(obj));
    }
    this.removeSave = function(){
        localStorage.removeItem("Relationship,"+self.title)
    }
    this.open = function(name){
        var obj = JSON.parse(localStorage.getItem("Relationship,"+name));
        if(obj){
            self.title = obj.title;
            self.connection = obj.connection;
            self.labels = obj.labels;
            self.pos = obj.pos;
        }else{
            self.title = name;
        }
    }
    this.labelSet = function(left, right){
        self.labels[0] = left;
        self.labels[1] = right;
        self.save();
    }
    this.leftConnection = function(table, column){
        self.connection.left = [ table, column ];
        self.save();
    }
    this.sql = function(path){
        if(!path){
            path = "./";
        }
        var finalSQL = "SELECT ";

        var leftLabel = self.left();
        var rightLabel = self.right();

        finalSQL += "':START_ID("+self.labels[0]+")', ':END_ID("+self.labels[1]+")' UNION ALL SELECT ";

        // left projection
        finalSQL += "`l`.`"+labelToNewName(leftLabel, leftLabel.mainTable, leftLabel.key)+"` as 'START_ID("+self.labels[0]+")'";

        // right projection
        finalSQL += ", `r`.`"+labelToNewName(rightLabel, rightLabel.mainTable, rightLabel.key)+"` as 'END_ID("+self.labels[1]+")'";

        finalSQL += " FROM ";


        // left select start
        finalSQL +="( SELECT ";
        finalSQL += "`"+leftLabel.mainTable+"`.`"+leftLabel.key+"` as '"+labelToNewName(leftLabel, leftLabel.mainTable, leftLabel.key)+"'";
        if(!(self.connection.left[0]==leftLabel.mainTable && leftLabel.key==self.connection.left[1])){
            finalSQL+=", `"+self.connection.left[0]+"`.`"+self.connection.left[1]+"` as '"+labelToNewName(leftLabel, self.connection.left[0], self.connection.left[1])+"'";
        }
        finalSQL += " FROM ";
        finalSQL += "`"+leftLabel.mainTable+"`";
        angular.forEach(leftLabel.elements, function(table, tableName) {
            if(tableName!=leftLabel.mainTable && table.type=="join"){
                finalSQL += ((finalSQL!="")?" ":"")+"INNER JOIN "+tableName+" ON "+tableName+".`"+table.reference.split(",")[0]+"`=`"+leftLabel.mainTable+"`.`"+table.reference.split(",")[1]+"`";
            }
        });
        finalSQL += ") as l";
        // end left select

        finalSQL += " INNER JOIN ";

        // right select start
        finalSQL += "( SELECT ";
        finalSQL += "`"+rightLabel.mainTable+"`.`"+rightLabel.key+"` as '"+labelToNewName(rightLabel, rightLabel.mainTable, rightLabel.key)+"'";
        if(!(self.connection.right[0]==rightLabel.mainTable && rightLabel.key==self.connection.right[1])){
            finalSQL += ", `"+self.connection.right[0]+"`.`"+self.connection.right[1]+"` as '"+labelToNewName(rightLabel, self.connection.right[0], self.connection.right[1])+"'";
        }
        finalSQL += " FROM ";
        finalSQL += "`"+rightLabel.mainTable+"`";
        angular.forEach(rightLabel.elements, function(table, tableName) {
            if(tableName!=rightLabel.mainTable && table.type=="join"){
                finalSQL += ((finalSQL!="")?" ":"")+"INNER JOIN `"+tableName+"` ON `"+table.reference.split(",")[0]+"`=`"+rightLabel.mainTable+"`.`"+table.reference.split(",")[1]+"`";
            }
        });
        finalSQL += ") as r";
        // end right select


        // How the two are connected
        finalSQL += " ON `l`.`"+labelToNewName(leftLabel, self.connection.left[0], self.connection.left[1])+"`=`r`.`"+labelToNewName(rightLabel, self.connection.right[0], self.connection.right[1])+"`";
        finalSQL += " INTO OUTFILE '"+path+self.title+"_relation.csv' FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\\n';";

        return finalSQL;
    }
    this.rightConnection = function(table, column){
        self.connection.right = [ table, column ];
        self.save();
    }
    this.left = function(){
        if(self.labels[0]){
            return (new Label()).open(self.labels[0]);
        }
    }
    this.right = function(){
        if(self.labels[1]){
            return (new Label()).open(self.labels[1]);
        }
    }
}