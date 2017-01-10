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
        localStorage.setItem("Node,"+this.name, JSON.stringify(this));
    }
    this.open = function(name){
        var obj = JSON.parse(localStorage.getItem("Node,"+name));
        if(obj){
            this.mode = obj.mode;
            this.mainTable = obj.mainTable;
            this.name = name;
            this.elements={};
            this.key = obj.key;
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
            this.name = name;
        }
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
    this.selected = function(table, column){
        if(this.elements[table]){
            return this.elements[table].columns[column];
        }
        return 0;
    }
}