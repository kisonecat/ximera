var $ = require('jquery');
window.jQuery = $;

$(function() {
	// Get the modal
	var imageEnvironmentModal = document.getElementById("image-environment-modal");
	if(imageEnvironmentModal){
		var imageEnvironmentModalImg = document.getElementById("image-environment-modal-img");
		var imageEnvironmentModalCaptionText = document.getElementById("image-environment-modal-caption");
		// Get the <span> element that closes the modal
		var span = document.getElementsByClassName("image-environment-modal-close")[0];
		// When the user clicks on <span> (x), close the modal
		span.onclick = function () {
			imageEnvironmentModal.style.display = "none";
		}
		$('div.image-environment').each( function() {

			var imageEnvironment = $(this);

			$('img', imageEnvironment).each( function() {		

				// Get the image and insert it inside the modal - use its "alt" text as a caption
				var img = $(this);			
				img.click(function () {			
					imageEnvironmentModal.style.display = "block";
					imageEnvironmentModalImg.src = this.src;
					imageEnvironmentModalCaptionText.innerHTML = this.alt;
				})		
			});
		});
	}
});

