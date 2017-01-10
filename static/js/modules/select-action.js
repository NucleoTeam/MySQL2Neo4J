angular.module('m2n.selectAction', [])
    .component('selectAction', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/action', name: 'SelectActionDisplay', component: 'selectActionDisplay', useAsDefault: true}
        ]
    })
    .component('selectActionDisplay', {
        templateUrl: '/elements/selector.html',
        controller: [ "$rootRouter",
            function SelectActionController($rootRouter) {
                var self = this;
                self.nodes = function(){
                    $rootRouter.navigate(['/Label', "LabelSetting"]);
                }
                self.relations = function(){
                    $rootRouter.navigate(['/Relatioship', "RelationshipSetting"]);
                }
            }
        ]
    });