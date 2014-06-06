coreFiles="Idp_options.js Enums.js adapter.js helpfunctions.js Identity.js Idp.js Message.js MessageFactory.js MessagingStub.js Codec.js DataCodec.js DataMessage.js DataBroker.js"
conversationFiles="Resource.js Participant.js Conversation.js"

outCore="wonder_core.js"
outConversation="wonder_conversation.js"
outFull="wonder_full.js"

echo "creating $outCore ..."
echo "// wonder_core.js" > $outCore
echo "//----------------" >> $outCore
echo "" >> $outCore

for f in $coreFiles; do
	echo "" >> $outCore
	echo "// -------------------------------" >> $outCore
	echo "// $f" >> $outCore
	echo "// -------------------------------" >> $outCore
	echo "" >> $outCore
	cat $f >> $outCore
done
echo "done"


echo "creating $outConversation ..."
echo "// wonder_conversation.js" > $outConversation
echo "//-----------------------" >> $outConversation
echo "" >> $outConversation

for f in $conversationFiles; do
	echo "" >> $outConversation
	echo "// -------------------------------" >> $outConversation
	echo "// $f" >> $outConversation
	echo "// -------------------------------" >> $outConversation
	echo "" >> $outConversation
	cat $f >> $outConversation
done
echo "done"

echo "creating $outFull ..."
cat wonder_core.js wonder_conversation.js > wonder_full.js
echo "all done"
ls -l wonder_*.js

