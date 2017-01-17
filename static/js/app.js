angular.module('m2n', ["ngComponentRouter","m2n.selectMysqlTable", "m2n.labelSettings", 'm2n.selectAction', 'm2n.selectRelationship'])
    .value('$routerRootComponent', 'wrapper')
    .component('wrapper', {
        templateUrl: '/elements/wrapper.html',
        $routeConfig: [
            { path: '/label/...', name: 'Label', component: 'labelSettings' },
            { path: '/table/...', name: 'Table', component: 'selectTable' },
            { path: '/relations/...', name: 'Relationship', component: 'selectRelationshipRoute' },
            { path: '/select/...', name: 'Select', component: 'selectAction', useAsDefault: true }
        ]
    });