'use strict';

angular.module('filters.dirty', [])

.filter('returnDirtyItems', function () {
  return function (modelToFilter, form, treatAsDirty, removeTheseCharacters) {
    //removes pristine items
    //note: treatAsDirty must be an array containing the names of items that should not be removed
    for (var key in modelToFilter) {
      //delete the item if:
      //    * it exists on the form and is pristine, or...
      //    * does not exist on the form
      try{
        //console.log('checking ' + key + ' for pristine and found it is ' + form[key].$pristine);
      }
      catch(err){
        //console.log('key ' + key + ' did not have an element in the form');
      }
      if (removeTheseCharacters !== undefined && removeTheseCharacters.length > 0) {
        for (var CA = 0, len = removeTheseCharacters.length; CA < len; CA++ ) {
          try{
            //console.log('Index of ' + key + ' is: ' + modelToFilter[key].indexOf(removeTheseCharacters[CA]));
            if (modelToFilter[key].indexOf(removeTheseCharacters[CA]) >= 0) {
              modelToFilter[key] = modelToFilter[key].replace(removeTheseCharacters[CA], '', 'g');
            }
          }
          catch(err){
            //console.log('getting the index of ' + key + ' throws an error of ' + err + ' so we skipped it');
          }
        }
      }
      if ((form[key] && form[key].$pristine) || !form[key]) {
        //delete the item if the treatAsDirty argument is not present
        //console.log('Checking to see if ' + key + ' is to be treated as always dirty');
        if(treatAsDirty){
          //console.log('There is an array present for treatAsDirty');
          //delete the item if it is not in the treatAsDirty array
          if(treatAsDirty.indexOf(key) === -1){
            //console.log('The item ' + key + ' was not found in the always dirty array and has been deleted');
            //remove the pristine item from the parent object
            delete modelToFilter[key];
          } else {
            //console.log('The item ' + key + ' was found in the always dirty array and has been kept');
          }
        } else {
          //console.log('There is no array present for dirty items, so ' + key + ' will be removed');
          //remove the pristine item from the parent object
          delete modelToFilter[key];
        }
      }
    }
    return modelToFilter;
  };
})
;
