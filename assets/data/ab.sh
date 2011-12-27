for i in $(find . -type f); 
do sed -i.bak '$a\
}' $i;
done