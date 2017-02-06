angular.module('m2n', ["ngComponentRouter","m2n.compile","m2n.selectMysqlTable", "m2n.labelSettings", 'm2n.selectAction', 'm2n.selectRelationship'])
    .value('$routerRootComponent', 'wrapper')
    .component('wrapper', {
        templateUrl: '/elements/wrapper.html',
        $routeConfig: [
            { path: '/label/...', name: 'Label', component: 'labelSettings' },
            { path: '/table/...', name: 'Table', component: 'selectTable' },
            { path: '/compile/...', name: 'Compile', component: 'compileProject' },
            { path: '/relations/...', name: 'Relationship', component: 'selectRelationshipRoute' },
            { path: '/select/...', name: 'Select', component: 'selectAction', useAsDefault: true }
        ],
        controller: [ "$rootRouter", function AppController( $rootRouter ){
            var self = this;
            self.label = new Label();
            self.compile = function(){
                $rootRouter.navigate(['/Compile', 'DisplayProject']);
            };
        }]
    });