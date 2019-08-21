FROM httpd:2.4

# Dependencies
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y \
  make \
  perl-modules \
  liburi-perl \
  liburi-encode-perl \
  libwww-perl \
  libjson-perl \
  libdbi-perl \
  libdbd-mysql-perl \
  libdbd-sqlite3-perl \
  libdigest-md5-perl \
  libfile-slurp-perl \
  libhtml-strip-perl \
  liblist-moreutils-perl \
  libcache-memcached-perl \
  libhtml-template-perl \
  libdigest-md5-perl \
  libdigest-md5-file-perl \
  libdatetime-perl \
#  libdatetime-format-ISO8601-perl \
  liblist-allutils-perl \
  libposix-strptime-perl \
  libuuid-tiny-perl \
  libmongodb-perl \
  libfreezethaw-perl \
  libtemplate-perl \
  libclass-isa-perl
  
RUN apt-get install -y \
  vim
    
ENV PERL_MM_USE_DEFAULT 1

COPY . /usr/local/apache2/htdocs/SequenceCenter/
# Deploy shock.cgi - maintain backwards compatibility
RUN mkdir -p /usr/local/apache2/htdocs/SequenceCenter/authServer/cgi-bin/ && cp  /usr/local/apache2/htdocs/SequenceCenter/cgi-bin/shock.cgi /usr/local/apache2/htdocs/SequenceCenter/authServer/cgi-bin/
# done - maintain backwards compatibility 
RUN ( cd /usr/local/apache2/htdocs ; ln -s SequenceCenter/authServer . )

COPY httpd.conf /usr/local/apache2/conf/
