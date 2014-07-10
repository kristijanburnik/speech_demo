
pair=$( ./speech-generate-pair.sh )
./speech-streaming-downstream.sh $pair > downstream.stt &
./speech-streaming-upstream.sh raw/rb-18.raw meta/rb-18.meta $pair &
tail -f downstream.stt
