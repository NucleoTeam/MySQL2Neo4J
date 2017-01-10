angular.module('m2n.labelSettings', ["m2n.neo4j.label"])
    .component('labelSettings', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/name', name: 'LabelSetting', component: 'labelName', useAsDefault: true}
        ]
    })
    .component('labelName', {
        templateUrl: '/elements/node/createNode.html',
        controller: [ 'Label', "$rootRouter",
            function LabelNameController(label, $rootRouter) {
                var self = this;
                self.label = label;
                self.labels = new Array();

                self.open = function(name){
                    label.open(name);
                    $rootRouter.navigate(['/Table', "TableList"]);
                }
                self.start = function(){
                    label.open(angular.element("#inputLabel").val());
                    $rootRouter.navigate(['/Table', "TableList"]);
                }
                self.removeSave = function (name){
                    console.log(name);
                    label.removeSave(name);
                    self.readExisting();
                }
                self.readExisting = function(){
                    self.labels = new Array();
                    for(var i in localStorage)
                    {
                        self.labels.push(JSON.parse(localStorage[i]));
                    }
                }
                self.readExisting();
            }
        ]
    });
