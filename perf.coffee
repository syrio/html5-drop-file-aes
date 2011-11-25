class AESEncryptor
  
  constructor: ->
    
  encrypt: (data) ->
    encrypted_data = sjcl.encrypt 'f76e9d3884236', data
  
  decrypt: (data) ->
    

class Bench

  constructor: ->
    @output = $('#benchResults')

  runSync: (tested) ->
    bench = new Benchmark('aes-test', tested, {maxTime: 20})
    results = bench.run()
    mean = results.stats.mean.toPrecision(5)
    sample_size = results.stats.size
    if sample_size > 1  
      @output.text "Mean running time was: #{mean} seconds, with sample size of #{sample_size}"
    else
      @output.text "Ran test once (large file was given) and running time was: #{mean} seconds"


class ReadHandler

  constructor: (file) ->

    @bench = new Bench
    @encryptor = new AESEncryptor
    
    @reader = new FileReader()
    
    @reader.onload = @onRead
    @reader.onerror = @onError
    
    @reader.readAsBinaryString file
  
  handleData: (data) =>
    @encryptor.encrypt data
    
  onRead: (read_evt) =>
    
    window.read_evt = read_evt
    
    read_file = read_evt.target

    @bench.runSync =>
      @handleData(read_file.result)


  onError: =>
    $('#error').text "Sorry, but something went wrong. Error code: #{@reader.error.code}"
    

class DropHandler
  
  constructor: (element) ->
    
    element.addEventListener 'drop', @onDrop, false
    element.addEventListener 'dragenter', @handleOnOurOwn, false
    element.addEventListener 'dragover', @handleOnOurOwn, false
    element.addEventListener 'dragleave', @handleOnOurOwn, false
    
  
  handleOnOurOwn: (evt) ->
    evt.stopPropagation()
    evt.preventDefault()
  
  onDrop: (evt) =>
    
    @handleOnOurOwn(evt)
    
    file = evt.dataTransfer.files[0]
    
    $('#fileDetails').text "A new file named #{file.name} that is #{file.size} bytes in size was dropped!"
    
    handler = new ReadHandler(file)
    
    
$(document).ready -> 

  do setupApplication = ->
    element = document.getElementById 'playingField'
    new DropHandler element



  
  
  