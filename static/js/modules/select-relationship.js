function calculateLine(elements){
    var elem1 = $(elements[0]);
    var elem2 = $(elements[1]);
    var pos1 = elem1.offset();
    var pos2 = elem2.offset();
    var left = pos1.left-pos2.left+elem1.outerWidth()-5;
    var top = pos2.top-pos1.top;

    var hyp = Math.sqrt(Math.pow(left,2)+Math.pow(top,2));
    var angle = Math.asin(top/hyp);

    angular.element(".line").css({ transformOrigin:"top left", transition: "0.4s", transform:"rotate("+(angle*180/Math.PI)+"deg)",width:hyp,left:pos1.left-30});
    angular.element(".line").css({ top:pos1.top-elem1.outerHeight(), position:"absolute" });
}
angular.module('m2n.selectRelationship', ["m2n.neo4j.label"])
    .component('selectRelationshipRoute', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/', name: 'RelationshipView', component: 'relationView', useAsDefault: true},
            {path: '/columns/:labels/:title', name: 'RelationshipColumn', component: 'relationColumn'}
        ]
    })
    .component('relationView', {
        templateUrl: '/elements/relationship/createRelationship.html',
        controller: ['$http', 'Label', "$rootRouter", function RelationshipViewController($http, label, $rootRouter) {
            var self = this;
            self.label = label;
            self.objects = new Array();
            self.title = "";
            self.labels = new Array();
            self.readExisting = function(){
                self.labels = new Array();
                for(var i in localStorage)
                {
                    self.labels.push(JSON.parse(localStorage[i]));
                }
            }
            self.got = function(){
                $rootRouter.navigate(['/Relationship', "RelationshipColumn", {labels:self.objects[0].name+","+self.objects[1].name, title:self.title}]);
            }
            self.select = function(i, obj){
                if(obj==self.objects[i]){
                    self.objects[i]='';
                }else{
                    self.objects[i]=obj;
                }
            };
            self.readExisting();
        }]
    })
    .component('relationColumn', {
        templateUrl: '/elements/relationship/columnRelationship.html',
        controller: ['$http', "$rootRouter", function RelationshipViewController($http, $rootRouter) {
            var self = this;
            self.labelTitle = new Array();
            self.labelData = {};
            self.labels = {};
            self.title = "";
            self.gotoRelationStart = function(){
                $rootRouter.navigate(['/Relationship']);
            }
            self.pos = new Array();
            self.$routerOnActivate = function(next) {
                self.title = next.params.title;
                try {
                    self.labelTitle = decodeURIComponent(next.params.labels).split(",");
                    for(i in self.labelTitle){
                        var x = self.labelTitle[i];
                        var entry = new Label();
                        entry.open(x);
                        self.labels[x]=entry;
                        angular.forEach(entry.elements, function(table, tableName) {
                            var p = i;
                            $http.get('/table/info/'+tableName).then(function(response) {
                                if(!self.labelData[p]){
                                    self.labelData[p] = {};
                                }
                                self.labelData[p][tableName] = response.data.columns;
                            });
                        });
                    }
                }catch(e){
                    console.log(e);
                }
            }
            self.leftSide = function($event, s) {
                self.pos[0] = $event.currentTarget;
                calculateLine(self.pos);
            }
            self.rightSide = function($event, s) {
                self.pos[1] = $event.currentTarget;
                calculateLine(self.pos);
            }
        }]
    })