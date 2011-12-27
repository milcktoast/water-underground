for i in $(find . -type f); 
do perl -i -p -e 's/\n/\,/g;s/NaN/null/g' $i;
done