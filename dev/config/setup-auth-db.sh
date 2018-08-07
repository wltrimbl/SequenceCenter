#! /bin/bash

result=1

while [ $result -ne 0 ]
do   
 # mysql -u authService --password=authServicePassword --host db -T -D DemoAppUsers  < /tmp/dbsetup.demo.mysql
 sleep 5
 echo Initializing database `date`
 echo "mysql -u $MYSQL_USER --password=$MYSQL_PASSWORD --host $MYSQL_HOST -T -D $MYSQL_DATABASE  < /tmp/auth-db.mysql"
 mysql -u $MYSQL_USER --password=$MYSQL_PASSWORD --host $MYSQL_HOST -T -D $MYSQL_DATABASE  < /tmp/auth-db.mysql
 result=$?
done

httpd-foreground
