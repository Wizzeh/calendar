function filesys_enabled()
{
	if(window.requestFileSystem) //window.File && window.FileReader && window.FileList && window.Blob
	{
		return true;
	}
	else
	{
		return false;
	}
}