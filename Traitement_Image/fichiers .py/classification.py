import cv2
from time import time
import matplotlib.pyplot as plt

opencv_dnn_model = cv2.dnn.readNetFromCaffe(prototxt="/Users/yosh/Desktop/integration/prot/deploy.prototxt ",
                                            caffeModel="/Users/yosh/Desktop/integration/res10_300x300_ssd_iter_140000_fp16.caffemodel ")


def cvDnnDetectFaces(image, opencv_dnn_model, min_confidence=0.5, display=True):
    '''
    This function performs face(s) detection on an image using opencv deep learning based face detector.
    Args:
        image:               The input image of the person(s) whose face needs to be detected.
        opencv_dnn_model:    The pre-trained opencv deep learning based face detection model loaded from the disk
                             required to perform the detection.
        min_confidence:      The minimum detection confidence required to consider the face detection model's
                             prediction correct.
        display:             A boolean value that is if set to true the function displays the original input image,
                             and the output image with the bounding boxes drawn, confidence scores, and time taken
                             written and returns nothing.
    Returns:
        output_image: A copy of input image with the bounding boxes drawn and confidence scores written.
        results:      The output of the face detection process on the input image.
    '''

    # Get the height and width of the input image.
    image_height, image_width, _ = image.shape

    # Create a copy of the input image to draw bounding boxes and write confidence scores.
    output_image = image.copy()

    # Perform the required pre-processings on the image and create a 4D blob from image.
    # Resize the image and apply mean subtraction to its channels
    # Also convert from BGR to RGB format by swapping Blue and Red channels.
    preprocessed_image = cv2.dnn.blobFromImage(image, scalefactor=1, size=(300, 300),
                                               mean=(104.0, 117.0, 123.0), swapRB=False, crop=False)

    # Set the input value for the model.
    opencv_dnn_model.setInput(preprocessed_image)

    # Get the current time before performing face detection.
    start = time()

    # Perform the face detection on the image.
    results = opencv_dnn_model.forward()

    # Get the current time after performing face detection.
    end = time()
    num = 0
    # Loop through each face detected in the image.
    for face in results[0][0]:

        # Retrieve the face detection confidence score.
        face_confidence = face[2]

        # Check if the face detection confidence score is greater than the thresold.
        if face_confidence >= min_confidence:
            num += 1
            # Retrieve the bounding box of the face.
            bbox = face[3:]
            # print(num)
            # Retrieve the bounding box coordinates of the face and scale them according to the original size of the image.
            x1 = int(bbox[0] * image_width)
            y1 = int(bbox[1] * image_height)
            x2 = int(bbox[2] * image_width)
            y2 = int(bbox[3] * image_height)

            # Draw a bounding box around a face on the copy of the image using the retrieved coordinates.
            cv2.rectangle(output_image, pt1=(x1, y1), pt2=(x2, y2), color=(0, 255, 0), thickness=image_width // 200)

            # Draw a filled rectangle near the bounding box of the face.
            # We are doing it to change the background of the confidence score to make it easily visible.
            cv2.rectangle(output_image, pt1=(x1, y1 - image_width // 20), pt2=(x1 + image_width // 16, y1),
                          color=(0, 255, 0), thickness=-1)

            # Write the confidence score of the face near the bounding box and on the filled rectangle.
            cv2.putText(output_image, text=str(round(face_confidence, 1)), org=(x1, y1 - 25),
                        fontFace=cv2.FONT_HERSHEY_COMPLEX, fontScale=image_width // 700,
                        color=(255, 255, 255), thickness=image_width // 200)

    # Check if the original input image and the output image are specified to be displayed.
    # print('num faces', num)
    if display:

        # Write the time take by face detection process on the output image.
        cv2.putText(output_image, text='Time taken: ' + str(round(end - start, 2)) + ' Seconds.', org=(10, 65),
                    fontFace=cv2.FONT_HERSHEY_COMPLEX, fontScale=image_width // 700,
                    color=(0, 0, 255), thickness=image_width // 500)

        # Display the original input image and the output image.
        plt.figure(figsize=[5, 5])
        plt.subplot(121)
        plt.imshow(image[:, :, ::-1])
        plt.title("Original Image")
        plt.axis('off')
        plt.subplot(122)
        plt.imshow(output_image[:, :, ::-1])
        plt.title("Output")
        plt.axis('off')
        plt.show()

    return num

    # Otherwise
    # else:
    #
    #     # Return the output image and results of face detection.
    #     return output_image, results,num

def is_abstract(input_image, confidence=0.3):
    image = cv2.imread(input_image)
    number_of_faces = cvDnnDetectFaces(image, opencv_dnn_model, min_confidence=confidence, display=False)
    if number_of_faces == 0:
        return True
    else:
        return False


