'use strict';
angular.module('owm.resource.edit.pictures', [])
.controller('ResourceEditPicturesController', function ($q, $timeout, $filter, $scope, alertService, resourceService, Analytics) {

  var resource = $scope.$parent.resource;

  // scope exports
  angular.extend($scope, {
    photos       : [],
    emptySlots   : [],
    addPicture   : addPicture,
    removePicture: removePicture
  });

  // configure "as-sortable" - see https://github.com/a5hik/ng-sortable
  $scope.sortableOptions = {
    containment: '.photo-grid',
    orderChanged: function (e) {
      savePictures($scope.photos);
    }
  };

  initPhotos();

  function initPhotos () {
    $scope.photos = createArray(resource.pictures);
    $scope.emptySlots = [];
    for (var i=1; i <= (3 - $scope.photos.length); i++) {
      $scope.emptySlots.push(i);
    }
  }

  function reloadResource () {
    return resourceService.get({
      id: resource.id
    }).then(function (reloaded) {
      resource.pictures = reloaded.pictures;
      initPhotos();
    }).catch(function (err) {
      alertService.addError(err);
    });
  }

  function createArray (pictures) {
    var out = [];
    var sorted = $filter('orderBy')(pictures, 'order');
    angular.forEach(sorted, function (picture) {
      out.push({
        url: $filter('resourceAvatar')(picture, 'small'),
        originalPicture: picture
      });
    });

    // DEBUG
    // out.push({
    //   url: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAGQAhgMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAEBQACAwEGB//EADMQAAEEAQMDAwMCAwkAAAAAAAEAAgMRBAUSITFBUQYTYSJxgRQjMkJiBxUzNJGhsdHw/8QAGAEAAwEBAAAAAAAAAAAAAAAAAAECAwT/xAAdEQEBAQEAAwEBAQAAAAAAAAAAARECEiExQQMi/9oADAMBAAIRAxEAPwDu1UdGigFwtQTx2sRtZqbqB5aL+6N03Ea5he4cpXrEu/VJXAiyar7J9pTrx2/ZJfMYZEOyTcB1HKq/gBw6jqfKYzx220rncWN47dB5CchdLSbXAkdxRQnvc7XmnA1av7wuwbHk9D8fdDZABsj8hP4lZ8x3dVkZqffZ3BWN2C0nkdFmT2Ki1eCXyXXwqzSXH9gh93ddld9P4SGOPcC0jws4pNrxzyLX1fTtBh9W/wBmGANOxcWLU4pY4nzCJrXfS/a4uI5P0Hd80nEOgenpdTh9J4mFjPZhY7Z9Qn9tvuyGxtYXVdu5c6jwAB0PDwa+YYZuFvItbgWF9jbBo8nvYOVi6HHp7RthEU7d/wCW7RtP2JSl+hY2uelGQaZFjDJgyjCMgMaC5rHlm4kdbbTvlVEV8vdQ6qL67HpOnOyhoelMxo5MSFsmRkux2SPJPRpsdTyT44UTGPDgrtikI2ceVb3x5SDx+vsjdnl0bao8p5pDNsMY/p7oXVcZrn7gLty3nc2DHaXAlobyljSG5axzCA5rj8FINSjLJHX0S2fWIQ8ex7gd5aeq4NZdIQJmmj3IpP4VsqrnOa4kfkeVA8H4+CtNoeN8J3NPVp7Lntjvuaf6m2EtLLGL2g8hZOaT06oota0cyMB8hhXC+ID6pST8AKTBhrgTfQrZuLI9lNaXfhaRujJ+mSvwrnInj/wq/wBbKDek9G+q9S9JaZn4ePgsnGRJ70TpHkCOTaGnjuKaOOOiTenfU2raB6hl1Zn780+4ZImuptxs/Y308IRupZTG/uuB+Fb9UJm2bCW0Y+kZfrkZOG9unaTjYUs4uSWg51nqRwOfkob036syNBwcjGix2TCR2+MucfodVc+RwF47FnBhbXYLb3h5WsZ36c6br2oaZnT5uLPc84Ilc8bt1m7USJ03yon6DUZJVv1fyhXNICxdYT8U6axEZNtJ+bREcLZYyxwB7JRgze3MC48HqmsUobIR2KmteLsJcrSzjZfvY8bXM7tIQ4w2CQvELj4aegXrdgk7LgxG3yAE+e89F1/Oa8xj4Ejf3Bxz/Cm7sAGAPCYPhaBtaEzOIBhVSm5VzXgcmCR5d7beAgH4bCzkkS3zu7r2gxG2WkdVhJpzSeWgo5yF1LXjnYbdgDHEy3/L2THEwJWsDpXE8J6zTmA9ArzMaxlUjq6fPOPPZcNMoKrozsia6hxZTZsLXPLnUQOgS7LeDM6ugNKIfXqJ7u0UOFU5CHc5UJtaxiIM5UQyiQegeFg+O1rdrRjL7LVmGZAbHCJc5zS0n7IpkQaNzuAFg+RkzHFoqjSjqel8X/Q/DmDgOUa6QbUjx3+2j4JRIaPKzdAzEaZZNx/hBoJ09o/T7SV5HLzcjDmb7Y3M/wCFvJ6kqGgLd4RaYvIOyegOCruIrsl+JlHOpzgRRvoiZXFiQVleGhK8qezQPda5U55QMTTJLygrci0j3thtordYCWvjKdyRfst+5QcsKvxxhe7StzCs/bPhHviVREqkToVsSiObEojBpiIuUTFH0XS0LRnCpKZLB+lfx/60tZAwa37TDta6HkeCnBDZGFjuhHKGx8DZn/qXuJDWbW89kfgn0A9pZIWO4IV48sY17muLB/MBa31gRkte0/XVGkEDujI62FjXVzdi2TrWnO/ne8+Az/tDtn05rw901h/QBvI+6VyxxxyFmRESOzm8FZe1iDqZT4FhLW3g9nh5eAIbiyYj+aWUuWyaxE4Ob5C83gYTJJQ8x0wdAe6avqL+EABJFmVaV3lE4UO2MyO4v/YIXCAnmO/lrea8ovU37NPyCOKjNK+ed9sP6dfijMyKV3s8Cj9B3A7gqyhC4sEEUOG+Nv7h6n8ImR3Vasg72qu1WcVy0ydqlFQvCikzbcpvA6mkkjz5sn/Lx8eSq5TchouWU89gjyPxp7Dlxvl9tjgT90TI4tFrxGmZhw9TBebBNEle0kkD4w5psEWp6tXzzCzMJcbKGhk2Oo9EVkIGQKGkMhhwZLAXV+Fxmi4odd0lbcqWLhrjXhd/vKYd0KN54oMVn00k+RP7jqZ0WcuRJObeeFVrVFoHabJseflHZWyaF8Tz9LxRSyAUu52V+nYHO6FacdflZd877bxgRNaCT9AoC7WckwQX6sSDgrF8p8rTYzwa6dZmf5QJkPlVMhS8j8Rjp/lcQO8qJeQwy0N5GOrTyOkyKceF1REaX4U6qxrJGlookJ96eyJJcQskNhvRRRNMFZHRBvUUUVcCyrArqiRrxhbNCiikxMISr1C4gxtvilFFULr4psaMZhHUoZsjtxbfAXVE0Vr2C5SiiRJQUUUQH//Z',
    //   originalPicture: { id: 0 }
    // });
    // out.push({
    //   url: 'data:image/jpeg;base64,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',
    //   originalPicture: { id: 0 }
    // });
    return out;
  }

  function addPicture (file) {
    $scope.isBusy = true;

    return resourceService.addPicture({
      resource: resource.id
    }, {
      image: file
    })
    .then(function (something) {
      Analytics.trackEvent('resource', 'picture_uploaded', resource.id);
      return reloadResource();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isBusy = false;
    });
  }

  function removePicture (photo, index) {
    $scope.isBusy = true;

    return resourceService.removePicture({
      picture: photo.originalPicture.id
    })
    .then(function (res) {
      return reloadResource();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isBusy = false;
    });
  }

  function savePictures (photos) {
    var pending = [];
    $scope.isBusy = true;

    angular.forEach(photos, function (photo, index) {
      pending.push(
        resourceService.alterPicture({
          picture: photo.originalPicture.id,
          newProps: {
            order  : index
          }
        })
      );
    });

    return $q.all(pending).then(function (results) {
      return reloadResource();
    })
    .catch(function (err) {
      alertService.addError(err);
    })
    .finally(function () {
      $scope.isBusy = false;
    });
  }

});
