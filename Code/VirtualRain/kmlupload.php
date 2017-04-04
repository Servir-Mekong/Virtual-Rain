<?php
	if(isset($_POST) == true){
		$errors= array();
	    $file_name = $_FILES['image']['name'];
	    $file_size =$_FILES['image']['size'];
	    $file_tmp =$_FILES['image']['tmp_name'];
	    $file_type=$_FILES['image']['type'];   
	    $file_ext=strtolower(end(explode('.',$_FILES['image']['name'])));
	    $extensions = array("kml","kmz"); 		
	    if(in_array($file_ext,$extensions )=== false){
	    	$errors[]="extension not allowed, please choose a KML or KMZ file.";
	    }
	    if($file_size > 1048576){
	    	$errors[]='File size grater than 1 MB';
	    }				
	    if(empty($errors)==true){
	    	move_uploaded_file($file_tmp,"kmluploads/".$file_name);
	    }else{
			
	        $myfile = fopen("kmluploads/log.txt", "w") or die("Unable to open file!");
			$txt = implode("\n", $errors);
			fwrite($myfile, $txt);
			fclose($myfile);
	    }
	}
?>
