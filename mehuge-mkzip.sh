#!/bin/bash
Zip() {
	z=$1 ; shift
	case "$z" in
	*.zip) 
		rm -f "./$z"
		main="$1" ; shift
		case "$main" in
		mehuge-full) ;;
		*) zip -r $z $main ;;
		esac
		for arg in "$@" ; do
			case "$arg" in
			mehuge-full) ;;	# Dummy
			-*) zip -d $z "${arg#-}" ;;
			+*) zip -r $z "${arg#+}" ;;
			*) zip -r $z "$arg" ;;
			esac
		done
		case "$main" in
		mehuge-full) ;;
		*)	files=`unzip -l $zip | while read length date time name ; do
				case "$length" in
				[0-9]*) echo $name ;;
				esac
			done`
			{
				sed "s/^!//g" <<-EOF
				!{	"zip": "$zip",
				!	"files": [
				EOF
				for arg in $files ; do
					echo "		\"$arg\","
				done
				sed "s/^!//g" <<-EOF
				!	""
				!	]
				!}
				EOF
			} > $main/uninst.json
			zip $z $main/uninst.json
			;;
		esac
		mv $z /d/Dropbox/Public
		ls -l /d/Dropbox/Public/$z
		;;
	*) echo "Invalid arguments $@" ;;
	esac
}

bigzip=""
while read zip files
do
	Zip $zip $files
	bigzip="$bigzip $files"
done <<-EOF
	mehuge-announcer.zip 	mehuge-announcer	mehuge-announcer.ui -mehuge-announcer/*.ogg +mehuge-announcer/WilhelmScream.ogg
	mehuge-autoexec.zip 	mehuge-autoexec		mehuge-autoexec.ui
	mehuge-bct.zip 		mehuge-bct 		mehuge-bct.ui
	mehuge-combatlog.zip 	mehuge-combatlog 	mehuge-combatlog.ui
	mehuge-chat.zip 	mehuge-chat 	mehuge-chat.ui    mehuge	-mehuge-chat/chat-config.js
	mehuge-deathspam.zip 	mehuge-deathspam 	mehuge-deathspam.ui
	mehuge-group.zip 	mehuge-group 		mehuge-group.ui		mehuge
	mehuge-heatmap.zip 	mehuge-heatmap 		mehuge-heatmap.ui	vendor/cu-rest mehuge
	mehuge-lb.zip 		mehuge-lb 		mehuge-lb.ui		vendor/cu-rest
	mehuge-loc.zip 		mehuge-loc 		mehuge-loc.ui		vendor/cu-rest
	mehuge-perf.zip 	mehuge-perf 		mehuge-perf.ui		vendor/flot
	mehuge-pop.zip 		mehuge-pop 		mehuge-pop.ui		vendor/cu-rest
	mehuge-tweaks.zip 	mehuge-tweaks 		mehuge-tweaks.ui
EOF

# Finally add them all to a single zip
Zip mehuge-full.zip mehuge-full $bigzip

