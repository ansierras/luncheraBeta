
companion.service('adminserv',['DATESTUFF' ,'Auth','$http', '$firebaseObject', function(DATESTUFF, Auth, $http, $firebaseObject) {
	var userKey = '';
    var userStatus = null;
    var overallStates = ["Muy mal estado","Mal estado","Buen estado","Casi como nuevo","Nuevo"];
    var searchById = function(array, id){
        for(var entry of array){
            if (entry.id == id) {
                return entry;
                break;
            };
        }  
    }
	return {
        interpretDate: function(dateStr){
            var date = new Date(dateStr);
            return DATESTUFF.dayNames[date.getDay()] + ' ' + date.getDate() + ' de ' + DATESTUFF.monthNames[date.getMonth()] + ' de ' + date.getFullYear()
        },
        interpretDateLong: function(dateStr){
            var date = new Date(dateStr);
            var returnString = DATESTUFF.dayNames[date.getDay()] + ' ' + date.getDate() + ' de ' + DATESTUFF.monthNames[date.getMonth()] + ' de ' + date.getFullYear();
            returnString+=" a las " + (date.getUTCHours()-5) + ":" + date.getUTCMinutes()
            return returnString
        },
        interpretDateMessage: function(dateStr){
            var date = new Date(dateStr);
            var returnString = date.getDate() + '/' + DATESTUFF.monthNamesShort[date.getMonth()] + '/' + date.getFullYear();
            returnString+=" a las " + (date.getUTCHours()-5) + ":" + date.getUTCMinutes()
            return returnString
        }, 
	}
}])

