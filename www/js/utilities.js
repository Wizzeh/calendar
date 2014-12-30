month_names = [ "January", "February", "March", "April", "May", "June", 
		"July", "August", "September", "October", "November", "December" ];
month_names_short = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 
		'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function days_between(date1, date2) {

    // The number of milliseconds in one day
    var ONE_DAY = 1000 * 60 * 60 * 24

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime()
    var date2_ms = date2.getTime()

    // Calculate the difference in milliseconds
    var difference_ms = date1_ms - date2_ms

    // Convert back to days and return
    return Math.round(difference_ms/ONE_DAY)

}

function zero_pad(num, places) 
{
	var zero = places - num.toString().length + 1;
	return Array(+(zero > 0 && zero)).join("0") + num;
}

function is_bit_set(value, bitindex)
{
	return (value & (1 << bitindex)) !== 0;
}

if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}