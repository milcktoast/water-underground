for i in $(find . -type f); 
do perl -i -p -e "s/null/\"\"/g" $i;
done