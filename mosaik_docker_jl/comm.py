from ipykernel.comm import Comm

class CallbackComm:
    '''
    Interface for handling callbacks via ipykernel's Comm class.
    '''

    def __init__( self, target_name ):
        self.__comm = Comm( target_name = target_name )

    def send_line( self, line ):
        '''
        Send a single line of text.
        '''
        self.__comm.send( data = { 'out': line } )

    def send_data( self, data ):
        '''
        Send arbitrary data.
        '''
        self.__comm.send( data = data )

    def close( self, status ):
        '''
        Send final status message and close the comm channel.
        '''
        self.__comm.close( data = { 'done': status } )
