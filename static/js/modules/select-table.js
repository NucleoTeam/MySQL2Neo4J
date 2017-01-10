function appendSql(q, add, div){
    q.query+=((q.query!="")?div+" ":"")+add;
}
angular.module('m2n.selectMysqlTable', ["m2n.neo4j.label"])
    .component('selectTable', {
        templateUrl: '/elements/node/nodeWrapper.html',
        $routeConfig: [
            {path: '/', name: 'TableList', component: 'tableList', useAsDefault: true},
            {path: '/columns/:name', name: 'TableColumns', component: 'columnView' },
            {path: '/buildsql', name: 'BuildSQL', component: 'buildSQL' }
        ],
        controller: ["$interval", 'Label', "$rootRouter", function SelectTableController($interval, label, $rootRouter){
            var self = this;

            self.label = label;
            self.buildSql = function(){
                $rootRouter.navigate(['/Table', "BuildSQL"]);
            }
            $interval(function(){
                label.save();
            }, 5000);
        }]
    })
    .component('tableList', {
        templateUrl: '/elements/node/tables.html',
        controller: ['$http', 'Label', "$rootRouter", function TableListController($http, label, $rootRouter) {
            var self = this;
            if(label.name==""){
                $rootRouter.navigate(['/Label']);
            }
            self.label = label;
            self.nextStep = function(r){
                if(label.mode==1){
                    label.mainTable=r.table;
                    label.mode=2;
                }
                $rootRouter.navigate(['/Table', "TableColumns", {name: r.table}]);
            }
            $http.get('/table/list').then(function(response) {
                self.tables = response.data.tables;
            });
        }]
    })
    .component('columnView', {
        templateUrl: '/elements/node/columns.html',
        controller: ['$http', 'Label', "$rootRouter", function TableViewController($http, label, $rootRouter) {
            var self = this;
            self.label = label;
            self.columns = {};
            self.$routerOnActivate = function(next) {
                self.tablename = next.params.name;
                $http.get('/table/info/'+self.tablename).then(function(response) {
                    self.columns = response.data.columns;
                });
            }
            self.goToTables = function(){
                $rootRouter.navigate(['/Table', "TableList"]);
            }

        }]
    })
    .component('buildSQL', {
        templateUrl: '/elements/node/showSQL.html',
        controller: ['$http', 'Label', "$rootRouter", function TableListController($http, label, $rootRouter) {
            var self = this;
            self.label = label;
            var ass={query:""};
            self.buildProject = function(){
                var tmp={query:""};
                ass.query="";
                angular.forEach(self.label.elements, function(table, tableName) {
                    if(tableName==self.label.mainTable){
                        angular.forEach( table.columns, function( columnNewName, columnName){
                            if(table.include[columnName]){
                                var newName=((columnName!=columnNewName || self.label.key==columnName)?" as '"+columnNewName+((self.label.key==columnName && self.label.mainTable==tableName)?":ID("+self.label.name+")'":"'"):"");

                                var concat = ((self.label.key==columnName && self.label.mainTable==tableName)?"CONCAT('"+self.label.name.toLowerCase()+"',":"");
                                var concatEnd = ((self.label.key==columnName && self.label.mainTable==tableName)?")":"");
                                appendSql(tmp, concat+"`"+tableName+"`.`"+columnName+"`"+concatEnd+newName, ",");
                                appendSql(ass, ((columnName!=columnNewName || self.label.key==columnName)?"'"+columnNewName+((self.label.key==columnName && self.label.mainTable==tableName)?":ID("+self.label.name+")'":"'"):"'"+columnName+"'"), ",");
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
                            appendSql(ass, "'json_"+tableName+"'", ",");
                            var tmpJSON = "REPLACE(CONCAT('[',(SELECT GROUP_CONCAT(JSON_OBJECT("+objects.query+")) as only FROM `"+tableName+"` WHERE `"+table.reference.split(",")[0]+"`="+self.label.mainTable+"."+table.reference.split(",")[1]+"),']'),'\"', \"'\") as 'json_"+tableName+"'";/* stackoverflow 6660977*/
                            appendSql(tmp, tmpJSON, ",");
                        }else if(table.type=="join"){
                            angular.forEach( table.columns, function( columnNewName, columnName){
                                if(table.include[columnName]){
                                    var newName=((columnName!=columnNewName || self.label.key==columnName)?" as '"+columnNewName+((self.label.key==columnName && self.label.mainTable==tableName)?":ID("+self.label.name+")'":"'"):"");
                                    appendSql(ass, ((columnName!=columnNewName || self.label.key==columnName)?"'"+columnNewName+((self.label.key==columnName && self.label.mainTable==tableName)?":ID("+self.label.name+")'":"'"):"'"+columnName+"'"), ",");
                                    appendSql(tmp, "`"+tableName+"`.`"+columnName+"`"+newName, ",");
                                }
                            });
                        }
                    }
                });
                return tmp.query;
            }
            self.buildFrom = function(){
                var tmp={query:self.label.mainTable};
                angular.forEach(self.label.elements, function(table, tableName) {
                    if(tableName!=self.label.mainTable && table.type=="join"){
                        appendSql(tmp, " INNER JOIN "+tableName+" ON `"+table.reference.split(",")[0]+"`="+self.label.mainTable+"."+table.reference.split(",")[1], "");
                    }
                });
                return tmp.query;
            }
            var projectBuild = self.buildProject();
            var fromBuild = self.buildFrom();
            self.sql = "SELECT "+ass.query+" UNION ALL SELECT "+projectBuild+" FROM "+fromBuild+" INTO OUTFILE '/srv/csv/"+self.label.name+".csv' FIELDS TERMINATED BY ',' ENCLOSED BY '\"' LINES TERMINATED BY '\\n';";
        }]
    });