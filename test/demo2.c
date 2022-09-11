/* Test flawfinder.  This program won't compile or run; that's not necessary
   for this to be a useful test. */

#include <stdio.h>
#define hello(x) goodbye(x)
#define WOKKA "stuff"

main() {
 printf("hello\n");
}

/* This is a strcpy test. */

int demo(char *a, char *b) {
 strcpy(a, "\n"); // Did this work?
 strcpy(a, gettext("Hello there")); // Did this work?
 strcpy(b, a);
 sprintf(s, "\n");
 sprintf(s, "hello");
 sprintf(s, "hello %s", bug);
}