function calculateLine(elements){
    if(elements.length>1){
        var elem1 = $("a[i='"+elements[0]+"']");
        var elem2 = $("a[i='"+elements[1]+"']");
        var pos1 = elem1.offset();
        var pos2 = elem2.offset();
        var left = pos1.left+20-pos2.left+elem1.outerWidth()-5;
        var top = pos2.top-pos1.top;

        var hyp = Math.sqrt(Math.pow(left,2)+Math.pow(top,2));
        var angle = Math.asin(top/hyp);

        angular.element(".line").css({ transformOrigin:"top left", transition: "0.4s", transform:"rotate("+(angle*180/Math.PI)+"deg)",width:hyp,left:pos1.left-10});
        angular.element(".line").css({ top:pos1.top-elem1.outerHeight(), position:"absolute" });
    }
}
angular.module('m2n.selectRelationship', ["m2n.neo4j.label"])
    .component('selectRelationshipRoute', {
        template: '<ng-outlet></ng-outlet>',
        $routeConfig: [
            {path: '/', name: 'RelationshipView', component: 'relationView', useAsDefault: true},
            {path: '/columns/:labels/:title', name: 'RelationshipColumn', component: 'relationColumn'},
            {path: '/sql/:title', name: 'BuildSQLRelationship', component: 'buildSQLRelationship'}
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
            self.relations = new Array();
            self.open = function(title){
                var rel = new Relationship();
                rel.open(title);
                $rootRouter.navigate(['/Relationship', "RelationshipColumn", {labels:rel.labels[0]+","+rel.labels[1], title:rel.title}]);
            }
            self.removeSave = function(title){
                var rel = new Relationship();
                rel.open(title);
                rel.removeSave();
                self.readExisting();
            }
            self.readExisting = function(){
                self.labels = new Array();
                self.relations = new Array();
                for(var i in localStorage)
                {
                    if(i.includes("Node,")){
                        self.labels.push(JSON.parse(localStorage[i]));
                    }else if(i.includes("Relationship,")){
                        self.relations.push(JSON.parse(localStorage[i]));
                    }
                }
            }
            self.got = function(){
                if(self.title){
                    $rootRouter.navigate(['/Relationship', "RelationshipColumn", {labels:self.objects[0].name+","+self.objects[1].name, title:self.title}]);
                }else{
                    angular.element("#relname").fadeIn(function(){
                        setTimeout(function(){
                            angular.element("#relname").fadeOut();
                        },5000)
                    });
                }
            }
            self.back = function(){
                $rootRouter.navigate(['/Select/SelectActionDisplay']);
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
    .component('buildSQLRelationship', {
        templateUrl: '/elements/relationship/showSQL.html',
        controller: ['$http', "$rootRouter", function RelationshipViewController($http, $rootRouter) {
            var self = this;
            self.rel = new Relationship();
            self.sql = "";
            self.$routerOnActivate = function(next) {
                self.rel.open(next.params.title);
                self.sql = self.rel.sql();
            }
        }]
    })
    .component('relationColumn', {
        templateUrl: '/elements/relationship/columnRelationship.html',
        controller: ['$http', "$rootRouter", function RelationshipViewController($http, $rootRouter) {
            var self = this;
            self.rel = new Relationship();
            self.labelData = {};
            self.labels = {};
            self.gotoRelationStart = function(){
                $rootRouter.navigate(['/Relationship']);
            }
            self.build = function(){
                $rootRouter.navigate(['/Relationship', 'BuildSQLRelationship', {title:self.rel.title}]);
            }

            self.$routerOnActivate = function(next) {
                var title = next.params.title;
                self.rel.open(title);
                try {
                    self.rel.labels = decodeURIComponent(next.params.labels).split(",");
                    for(i in self.rel.labels){
                        var x = self.rel.labels[i];
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
                    self.rel.save();
                    setTimeout(function(){
                        calculateLine(self.rel.pos);
                    },100);

                }catch(e){
                    console.log(e);
                }
            }
            self.leftSide = function($event, s, table, column) {
                self.rel.pos[0] = $($event.currentTarget).attr('i');
                calculateLine(self.rel.pos);
                self.rel.leftConnection(table, column);
            }
            self.rightSide = function($event, s, table, column) {
                self.rel.pos[1] = $($event.currentTarget).attr('i');
                calculateLine(self.rel.pos);
                self.rel.rightConnection(table, column);
            }
        }]
    })
