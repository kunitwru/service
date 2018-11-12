const makeid = (length = 10) => {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}
function addMonths(date, months) {
    date.setMonth(date.getMonth() + months);
    return date;
}

module.exports = {
    makeid, addMonths
}