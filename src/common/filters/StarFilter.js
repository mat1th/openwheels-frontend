'use strict';

angular.module('filters.ratingStars', [])

.filter('ratingStars', function ($sce) {
  return function(_starsGiven) {
    var starsGiven = Math.ceil(_starsGiven || 0);
    var stars = '';
    var starsTotal = 5;
    var star = '<i class="fa fa-star text-warning"></i> ';
    var starEmpty = '<i class="fa fa-star-o"></i> ';
    var wrapper;
    if(angular.isNumber(starsGiven)) {
      for (var i = starsGiven - 1; i >= 0; i--) {
        stars = stars + star;
      }
      if(starsTotal > starsGiven) {
        for (var j = (starsTotal - starsGiven) - 1; j >= 0; j--) {
          stars = stars + starEmpty;
        }
      }
    }
    wrapper = '<span style="white-space:nowrap">' + stars + '</span>';
    return $sce.trustAsHtml(wrapper);
  };
})

;
