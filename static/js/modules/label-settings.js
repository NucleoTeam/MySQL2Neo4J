angular.module('m2n.labelSettings', ["m2n.neo4j.label"])
    .component('labelSettings', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/name', name: 'LabelSetting', component: 'labelName', useAsDefault: true}
        ]
    })
    .component('labelName', {
        templateUrl: '/elements/node/createNode.html',
        controller: ["$rootRouter",
            function LabelNameController($rootRouter) {
                var self = this;
                self.labels = new Array();

                self.open = function(name){
                    $rootRouter.navigate(['/Table', "TableList", {label: name}]);
                }
                self.back = function(name){
                    $rootRouter.navigate(['/Select', 'SelectActionDisplay']);
                }
                self.start = function(){
                    $rootRouter.navigate(['/Table', "TableList", {label: angular.element("#inputLabel").val()}]);
                }
                self.removeSave = function (name){
                    new Label().removeSave(name);
                    self.readExisting();
                }
                self.readExisting = function(){
                    self.labels = new Array();
                    for(var i in localStorage)
                    {
                        if(i.includes("Node,")){
                            self.labels.push(JSON.parse(localStorage[i]));
                        }
                    }
                }
                self.readExisting();
            }
        ]
    });
