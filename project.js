angular.module('project', ['ngResource'])
    .factory('ProjectCouch', function ($resource) {
        var ProjectCouch = $resource(':protocol//:server/:db/:q/:r/:s/:t',
            {protocol: 'http:', server: 'localhost:5984', db: 'seats'},
            {update: {method: 'PUT'}});
        ProjectCouch.prototype.update = function (cb) {
            return ProjectCouch.update({q: this._id}, this, cb);
        };
        return ProjectCouch;
    })
    .controller('TheController', function ($scope, ProjectCouch) {
        ProjectCouch.get({q: '_all_docs', include_docs: 'true', limit: 10}, function(rawseats) {
            $scope.const = {
                reduceOpacity: "fill-opacity:0.2"
            };
            $scope.seats = {};
            angular.forEach(rawseats.rows, function (value, key) {
                $scope.seats[value.doc.seat] = value.doc;
            });
        });

        function getSeat(id) {
            ProjectCouch.get({q: id}, function (seat) {
                console.log("getting... " + id);
                $scope.original = seat;
                $scope.selected = new ProjectCouch($scope.original);
            });
        }

        $scope.matches = function (seatNum) {
            return $scope.find === undefined || $scope.find.length === 0 || ( seatNum in $scope.seats && $scope.seats[seatNum].name.indexOf($scope.find) > -1)
        };

        $scope.show = function (seatNum) {
            if (!(seatNum in $scope.seats)) {
                var toShow = { seat: seatNum, name: "" };
                ProjectCouch.save(toShow, function(selected) {
                    toShow._id = selected.id;
                    $scope.seats[seatNum] = toShow;
                    getSeat(toShow._id);
                });
            } else {
                getSeat($scope.seats[seatNum]._id);
            }
        };

        $scope.isClean = function () {
            return angular.equals($scope.original, $scope.selected);
        };

        $scope.save = function () {
            $scope.selected.update(function () {
                $scope.seats[$scope.selected.seat] = $scope.selected;
                $scope.selected = undefined;
            });
        };
    });