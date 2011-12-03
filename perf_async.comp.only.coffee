

class FileHandler
  
  constructor: (file) ->
    
    block_size = 1024*512
    slice_index = 0
    blob = 0
    
    # Create a new queue.
    queue = $.jqmq

      # Queue items will be processed every 50 milliseconds.
      delay: -1,

      # Process queue items one-at-a-time.
      batch: 1,

      # For each queue item, execute this function.
      callback: (range) ->
        
        reader = new FileReader

        
        reader.onloadend = (evt) ->
          
          plaintext = evt.target.result
          
          return unless plaintext?
          
          # If we use onloadend, we need to check the readyState.
          if evt.target.readyState == FileReader.DONE
            
            # LZJB compress plaintext
            compressed = Iuppiter.compress(plaintext)
            
            # Finish this block, signal jqmq we can move on          
            queue.next()
           
            # jqmq convention
            return false

        # Read chunks of the file, not the entire things
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
        
        # Log how much time this whole process took
        console.log "All file handling is done, it took: #{(now-old) / 1000} seconds"
        
        $('#benchResults').text "All file handling is done, it took: #{(now-old) / 1000} seconds"
        
        # jqmq convention
        return false

    # get the time we started working for later (basic) measurement
    old = new Date()
    
    # start jqmq queue so it will be ready to fire as soon as we add block handlers
    queue.start()

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

