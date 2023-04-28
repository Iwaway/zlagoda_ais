function underAgeValidate(birthday) {
    const age = calculateAge(new Date(birthday));
    return age >= 18;
}

function calculateAge(birthday) { // birthday is a date
    const ageDifMs = Date.now() - birthday;
    const ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}

module.exports = {underAgeValidate}
