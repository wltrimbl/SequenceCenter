# SequenceCenter
Sequencing Center Data Management App

```bash
export TAG=`date +"%Y%m%d.%H%M"`
git clone --recursive https://github.com/MG-RAST/SequenceCenter
cd SequenceCenter
docker build -t mgrast/seqcenter:${TAG} .
skycore push mgrast/seqcenter:${TAG}
```
