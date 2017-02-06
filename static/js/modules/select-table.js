
angular.module('m2n.selectMysqlTable', [])
    .component('selectTable', {
        templateUrl: '/elements/node/nodeWrapper.html',
        $routeConfig: [
            {path: '/:label', name: 'TableList', component: 'tableList', useAsDefault: true},
            {path: '/columns/:label/:name', name: 'TableColumns', component: 'columnView' },
            {path: '/buildsql/:label', name: 'BuildSQL', component: 'buildSQL' }
        ],
        controller: ["$interval", "$rootRouter", function SelectTableController($interval, $rootRouter){
            var self = this;
            self.label = new Label();
            self.$routerOnActivate = function(next) {
                self.label.open(next.params.label);
            };
        }]
    })
    .component('tableList', {
        templateUrl: '/elements/node/tables.html',
        controller: ['$http', "$rootRouter", function TableListController($http, $rootRouter) {
            var self = this;

            self.label = new Label();
            self.$routerOnActivate = function(next) {
                self.label.open(next.params.label);
                if(self.label.name==""){
                    $rootRouter.navigate(['/Label']);
                }
            };
            self.buildSql = function(){
                self.label.save();
                $rootRouter.navigate(['/Table', "BuildSQL", {label: self.label.name}]);
            }
            self.back = function(){
                $rootRouter.navigate(['/Label']);
            };
            self.nextStep = function(r){
                if(self.label.mode==1){
                    self.label.mainTable=r.table;
                    self.label.mode=2;
                    self.label.save();
                }
                $rootRouter.navigate(['/Table', "TableColumns", {name: r.table, label:self.label.name}]);
            }
            $http.get('/table/list').then(function(response) {
                self.tables = response.data.tables;
            });
        }]
    })
    .component('columnView', {
        templateUrl: '/elements/node/columns.html',
        controller: ['$http', "$rootRouter", function TableViewController($http, $rootRouter) {
            var self = this;
            self.label = new Label();
            self.columns = {};
            self.$routerOnActivate = function(next) {
                self.tablename = next.params.name;
                self.label.open(next.params.label);
                $http.get('/table/info/'+self.tablename).then(function(response) {
                    self.columns = response.data.columns;
                });
            }
            self.goToTables = function(){
                $rootRouter.navigate(['/Table', "TableList", {label:self.label.name}]);
                self.label.save();
            }
        }]
    })
    .component('buildSQL', {
        templateUrl: '/elements/node/showSQL.html',
        controller: ['$http', "$rootRouter", function TableListController($http, $rootRouter) {
            var self = this;
            self.label = new Label();
            self.sql = "";
            self.back = function(){
                $rootRouter.navigate(['/Table', "TableList", {label: self.label.name}]);
            };
            self.$routerOnActivate = function(next) {
                self.label.open(next.params.label);
                self.sql = self.label.sql();
            };
        }]
    });