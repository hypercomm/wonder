set coreFiles=(Idp_options.js Enums.js adapter.js helpfunctions.js Identity.js Idp.js Message.js MessageFactory.js MessagingStub.js Codec.js DataCodec.js DataMessage.js DataBroker.js)
set conversationFiles=(Resource.js Participant.js Conversation.js)

set outCore="wonder_core.js"
set outConversation="wonder_conversation.js"
set outFull="wonder_full.js"

rem @echo OFF

echo // wonder_core.js > %outCore%
echo //---------------- >> %outCore%
echo.>> %outCore%

for %%f in %coreFiles% do (
	echo.>> %outCore%
	echo // ------------------------------- >> %outCore%
	echo // %%f >> %outCore%
	echo // ------------------------------- >> %outCore%
	echo.>> %outCore%
	copy /A %outCore%+%%f %outCore%
)


echo // wonder_conversation.js > %outConversation%
echo //----------------------- >> %outConversation%
echo.>> %outConversation%

for %%f in %conversationFiles% do (
	echo.>> %outConversation%
	echo // ------------------------------- >> %outConversation%
	echo // %%f >> %outConversation%
	echo // ------------------------------- >> %outConversation%
	echo.>> %outConversation%
	copy /A %outConversation%+%%f %outConversation%
)
copy /A %outCore%+%outConversation%+%%f %outFull%
