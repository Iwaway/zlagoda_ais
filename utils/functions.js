function underAgeValidate(birthday){
	var optimizedBirthday = birthday.replace(/-/g, "/");
	var myBirthday = new Date(optimizedBirthday);
	var currentDate = new Date().toJSON().slice(0,10)+' 01:00:00';
	var myAge = ~~((Date.now(currentDate) - myBirthday) / (31557600000));

	if(myAge < 18) {
     	    return false;
        }else{
	    return true;
	}
} 

module.exports = {
    underAgeValidate,
}