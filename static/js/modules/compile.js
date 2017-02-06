angular.module('m2n.compile', [])
    .component('compileProject', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/', name: 'DisplayProject', component: 'displayProject', useAsDefault: true}
        ]
    })
    .component('displayProject', {
        templateUrl: '/elements/compiledNeo4J.html',
        controller: ["$rootRouter", "$scope", function SelectTableController($rootRouter, $scope){
            var self = this;
            self.sql = "";
            self.path = "/srv/conv/";
            self.pathneo4j = "/srv/neo4j/";
            self.commandline = "";
            $scope.$watch("$ctrl.path", function pathChange(newV, oldV){
                self.rebuild();
            });
            $scope.$watch("$ctrl.pathneo4j", function pathChange(newV, oldV){
                self.rebuild();
            });
            self.rebuild=function(){
                self.sql = "";
                self.commandline = self.pathneo4j+"bin/neo4j-admin import --database=ban.db --multiline-fields=true --id-type=string ";
                for(var i in localStorage)
                {
                    if(i.includes("Node,"))
                    {
                        var label = new Label();
                        label.open(i.replace("Node,",""));
                        self.sql += "#\n#Label <"+label.name+">\n#\n"+label.sql(self.path)+"\n";
                        self.commandline += " --nodes:"+label.name+"=\""+self.path+label.name+"_label.csv\"";
                    }
                    else if(i.includes("Relationship,"))
                    {
                        var relationship = new Relationship();
                        relationship.open(i.replace("Relationship,",""));
                        self.sql += "#\n#Relationship <"+relationship.title+">\n#\n"+relationship.sql(self.path)+"\n";
                        self.commandline += " --relationships:"+relationship.title+"=\""+self.path+relationship.title+"_relation.csv\"";
                    }
                }
            }
        }]
    });