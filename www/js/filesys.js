function filesys_enabled()
{
	if(window.File && window.FileReader && window.FileList && window.Blob) //window.requestFileSystem
	{
		return true;
	}
	else
	{
		return false;
	}
}