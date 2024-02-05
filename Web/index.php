<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>UploadiFive Test</title>
<script src="jquery.min.js" type="text/javascript"></script>
<script src="jquery.uploadifive.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="./uploadifive.css">
<style type="text/css">
body {
	font: 13px Arial, Helvetica, Sans-serif;
	background-color: white;
    background-image: url(../test.webp);
    background-repeat: no-repeat;
}



</style>
</head>

<body>

	<form>
		<div class=main>
			<div class="file">
				<input type="file" id="file_upload" name="file_upload" multiple="false">
			</div>
			<a id="UploadButton"  href="javascript:$('#file_upload').uploadifive('upload')">Upload Files</a>

		</div>

		<div id="queue"></div>

	</form>
	
	<script type="text/javascript">
		<?php $timestamp = time();?>
		$(function() {
			$('#file_upload').uploadifive({
				'auto'             : false,
				'checkScript'      : 'check-exists.php',
				'fileType'         : '.jpg,.jpeg,.gif,.png',
				'formData'         : {
									   'timestamp' : '<?php echo $timestamp;?>',
									   'token'     : '<?php echo md5('unique_salt' . $timestamp);?>'
				                     },
				'queueID'          : 'queue',
				'uploadScript'     : 'uploadifive.php',
				'onUploadComplete' : function(file, data) { 
					console.log(data); 
					/**
					 * afficher message d'attente 
					 * lancer le calcul du modele 3D
					 * Quand c'est finis l'afficher sur une nouvelle page
					 * indiquer quand la machine est prete 
					 */
				
				}
			});
		});
	</script>
</body>
</html>