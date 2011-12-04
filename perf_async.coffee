

class FileHandler
  
  constructor: (file) ->
    
    ###
    
      What we do here:
    
      1. Start a Forge.js encryption cipher.
      2. Read in a chunk of the file (eg: 1-2 MB).
      3. Compress the chunk using Iupiiter.js LZJB compression.
         (A modification to the Iupiiter.js was done to have it accept and convert HTML5 Arrays, look for //! comments in lib/Iuppiter.js)
      4. Put that chunk in a forge.util.ByteBuffer  and pass it to cipher.update.
      5. Call cipher.output.getBytes() and do something with the encrypted data.
      6. Repeat until you've read your entire file and then call cipher.finish() and cipher.output.getBytes() one final time.
      7. Output what is happening (including timing) to console and HTML.
    
    ###
    
    block_size = 1024*512
    slice_index = 0
    blob = 0
    
    # randomly generate the IV (128 bits long) using Forge random API
    iv = forge.random.getBytes 128/8
    # randomly generate the key (256 bits long) using Forge random API
    key = forge.random.getBytes 256/8
    
    cipher = forge.aes.startEncrypting key, iv
    
    # Create a new queue.
    queue = $.jqmq

      # Queue items will be processed on after another
      delay: -1,

      # Process queue items one-at-a-time.
      batch: 1,

      # For each queue item, execute this function.
      callback: (range) ->
        
        reader = new FileReader

        # If we use onloadend, we need to check the readyState.
        reader.onloadend = (evt) ->
          
          plaintext = evt.target.result
          
          return unless plaintext?
          
          if evt.target.readyState == FileReader.DONE
            
            # LZJB compress plaintext
            compressed = Iuppiter.compress(plaintext)
            
            # Convert our array to a ByteBuffer, Forge.js own buffer implementation
            compressed_buffer = new forge.util.ByteBuffer()
          
            for int8 in compressed
              compressed_buffer.putInt8 int8
            
            # Encrypt this block
            cipher.update compressed_buffer          
            
            console.log "This is the length of encrypted block: #{cipher.output.data.length}"
            # Call getBytes so we can get the current block in it's encrypted form
            # this is done so we won't blow memory usage
            console.log "This is the length of read encrypted block: #{cipher.output.getBytes(cipher.output.length()).length}"
            
            # Finish this block, signal jqmq we can move on 
            # Calling next() using setTimeout can be used as sleep mechanism between working on blocks, 
            # this will result in decreasing performance while increasing responsiveness.
            queue.next()
            
            # jqmq convention       
            return false


        if file.webkitSlice? 
          blob = file.webkitSlice(range.start, range.stop + 1)
          reader.readAsArrayBuffer(blob)
        else if file.mozSlice?
          blob = file.mozSlice(range.start, range.stop + 1)
          reader.readAsArrayBuffer(blob)

        
      ,

      # When the queue completes naturally, execute this function.
      complete: ->
        now = new Date()
        
        cipher.finish()
        # Again, we output this just as an example of the need to call getBytes 
        # to make sure noting got left in the output buffer after calling cipher.finish that added PKCS#7 padding.
        console.log "This is the length of the finalx read encrypted block: #{cipher.output.getBytes(cipher.output.length()).length}"
        
        # Log how much time this whole process took
        console.log "All file handling is done, it took: #{(now-old) / 1000} seconds"
        
        $('#benchResults').text "All file handling is done, it took: #{(now-old) / 1000} seconds"
        
        return false

    # get the time we started working for later (basic) measurement
    old = new Date()
    
    # start jqmq queue so it will be ready to fire as soon as we add block handlers
    queue.start()

    # generate file block indexes and add them to the queue for processing
    while (slice_index < file.size)

    	if (file.size - slice_index) > block_size
    		block_stop = slice_index + block_size
    	else
    		block_stop = file.size
	
    	queue.add { start: slice_index, stop: block_stop }	

    	slice_index += block_size;
    
    
    


class DropHandler

  constructor: (element) ->

    element.addEventListener 'drop', @onDrop, false
    # disable the default browser's drop behavior by implementing these related events
    element.addEventListener 'dragenter', @handleOnOurOwn, false
    element.addEventListener 'dragover', @handleOnOurOwn, false
    element.addEventListener 'dragleave', @handleOnOurOwn, false


  handleOnOurOwn: (evt) ->
    evt.stopPropagation()
    evt.preventDefault()

  onDrop: (evt) =>

    @handleOnOurOwn(evt)
    
    # take the first file
    file = evt.dataTransfer.files[0]
    
    # Clear any previously handled file results
    $('#benchResults').text ''
    
    console.log "A new file named #{file.name} that is #{file.size} bytes in size was dropped!"
    $('#fileDetails').text "A new file named #{file.name} that is #{file.size} bytes in size was dropped!"

    handler = new FileHandler(file)



window.onload = ->
  do setupApplication = ->
    element = document.getElementById 'playingField'
    new DropHandler element

