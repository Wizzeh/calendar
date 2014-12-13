function pop_error(text)
{
	console.log(text);
	$("#popup_error_text").text(text);
	$("#errorconsole").text(text);
	$("#popup_error").popup("open");
}
function pop_loading(enable)
{
	if(enable == true)
	{
		$("#popup_loading").popup("open");
	}
	else
	{
		$("#popup_loading").popup("close");
	}
}