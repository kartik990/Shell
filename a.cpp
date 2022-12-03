#include <iostream>
using namespace std;

int main(int argc, char *argv[])
{
    int i = 100;
    while (1)
    {
        if (argc == 1)
            cout << "No arguments!";
        else
            for (int i = 1; i < argc; i++)
                cout << argv[i] << " ";
        cout << endl;
    }
    return 0;
}