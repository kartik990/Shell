#include <iostream>
#include <chrono>
#include <thread>

using namespace std;

int main(int argc, char *argv[])
{
    while (1)
    {
        if (argc == 1)
            cout << "No arguments!";
        else
            for (int i = 1; i < argc; i++)
                cout << argv[i] << " ";
        cout << endl;
        this_thread::sleep_for(std::chrono::milliseconds(200));
    }
    return 0;
}